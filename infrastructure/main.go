package main

import (
	"fmt"

	"github.com/dogmatiq/ferrite"
	"github.com/pulumi/pulumi-cloudflare/sdk/v5/go/cloudflare"
	"github.com/pulumi/pulumi-gcp/sdk/v7/go/gcp/compute"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

var (
	COMPUTE_INSTANCE_NAME = ferrite.
				String("COMPUTE_INSTANCE_NAME", "Unique name for compute instance").
				Required()
	GOOGLE_PROJECT = ferrite.
			String("GOOGLE_PROJECT", "GCP Project").
			Required()
	GOOGLE_SERVICE_ACCOUNT = ferrite.
				String("GOOGLE_SERVICE_ACCOUNT", "Service account linked to vm").
				Required()
	CLOUDFLARE_ZONE_ID = ferrite.
				String("CLOUDFLARE_ZONE_ID", "Cloudflare zone id").
				Required()
	CLOUDFLARE_API_TOKEN = ferrite.
				String("CLOUDFLARE_API_TOKEN", "Cloudflare API token").
				Required()
	GCP_SSH_PUBLIC_KEY = ferrite.
				String("GCP_SSH_PUBLIC_KEY", "SSH key for this instance").
				Required()
)

func main() {
	setupDev := func(ctx *pulumi.Context) error {
		static, err := compute.NewAddress(ctx, COMPUTE_INSTANCE_NAME.Value(), &compute.AddressArgs{
			Name:   pulumi.String(COMPUTE_INSTANCE_NAME.Value()),
			Region: pulumi.String("australia-southeast1"),
		})
		if err != nil {
			return err
		}

		instanceTemplate, err := compute.NewInstanceTemplate(ctx, fmt.Sprintf("%s-template", COMPUTE_INSTANCE_NAME.Value()), &compute.InstanceTemplateArgs{
			Name:         pulumi.Sprintf("%s-template", COMPUTE_INSTANCE_NAME.Value()),
			MachineType:  pulumi.String("e2-micro"),
			CanIpForward: pulumi.Bool(false),
			Tags: pulumi.ToStringArray([]string{
				"allow-cloudflare",
				"allow-ssh",
			}),
			NetworkInterfaces: &compute.InstanceTemplateNetworkInterfaceArray{
				&compute.InstanceTemplateNetworkInterfaceArgs{
					AccessConfigs: &compute.InstanceTemplateNetworkInterfaceAccessConfigArray{
						&compute.InstanceTemplateNetworkInterfaceAccessConfigArgs{
							NatIp: static.Address,
						},
					},
					Network: pulumi.String("shared-resources-network"),
				},
			},
			Disks: compute.InstanceTemplateDiskArray{
				&compute.InstanceTemplateDiskArgs{
					SourceImage: pulumi.String("debian-12-bookworm-v20240515"),
					AutoDelete:  pulumi.Bool(false),
					Boot:        pulumi.Bool(true),
					DiskSizeGb:  pulumi.Int(30),
				},
			},
			Scheduling: &compute.InstanceTemplateSchedulingArgs{
				Preemptible:       pulumi.Bool(true),
				AutomaticRestart:  pulumi.Bool(false),
				ProvisioningModel: pulumi.String("SPOT"),
				OnHostMaintenance: pulumi.String("MIGRATE"),
			},
			Metadata: pulumi.ToStringMap(map[string]string{
				"ssh-keys": GCP_SSH_PUBLIC_KEY.Value(),
			}),
			// Docker setup on Debian 12: https://www.thomas-krenn.com/en/wiki/Docker_installation_on_Debian_12
			// Permanently increase vm.max_map_count value: https://thetechdarts.com/how-to-change-default-vm-max_map_count-on-linux/
			MetadataStartupScript: pulumi.String(fmt.Sprintf(`#! /bin/bash 
				curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
				sudo bash add-google-cloud-ops-agent-repo.sh --also-install

				sudo apt update &&
				sudo apt install certbot python3-certbot-dns-cloudflare make git ca-certificates curl gnupg apt-transport-https gpg -y &&
				curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg &&
				echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null &&
				sudo apt update &&
				sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose -y &&
				sudo grep -qxF 'vm.max_map_count=262144' /etc/sysctl.conf || echo vm.max_map_count=262144 | sudo tee -a /etc/sysctl.conf &&
				sudo sysctl -p &&
				sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy && 
				echo "dns_cloudflare_api_token = %s" | sudo tee /etc/letsencrypt/dnscloudflare.ini &&
				echo "#! /bin/bash sudo docker service ls -q | xargs -n1 sudo docker service update --force" | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-services.sh &&
				sudo chmod 0600 /etc/letsencrypt/dnscloudflare.ini &&
				sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-services.sh &&
				sudo chmod 0600 /etc/letsencrypt/renewal-hooks/deploy/reload-services.sh &&
				sudo certbot certonly -d dev.skulpture.xyz,skulpture.xyz \
					--dns-cloudflare --dns-cloudflare-credentials /etc/letsencrypt/dnscloudflare.ini \
					--non-interactive --agree-tos \
					--register-unsafely-without-email \
					--dns-cloudflare-propagation-seconds 60`, CLOUDFLARE_API_TOKEN.Value())),
			ServiceAccount: &compute.InstanceTemplateServiceAccountArgs{
				Email: pulumi.StringPtr(GOOGLE_SERVICE_ACCOUNT.Value()),
				Scopes: pulumi.ToStringArray([]string{
					"cloud-platform",
				}),
			},
		})
		if err != nil {
			return err
		}

		instanceGroupManager, err := compute.NewInstanceGroupManager(ctx, "igm-sr", &compute.InstanceGroupManagerArgs{
			Name:             pulumi.String("tf-sr-igm"),
			BaseInstanceName: pulumi.String("tf-sr-igm-instance"),
			Zone:             pulumi.String("us-central1-a"),
			TargetSize:       pulumi.Int(1),
			Versions: compute.InstanceGroupManagerVersionArray{
				&compute.InstanceGroupManagerVersionArgs{
					InstanceTemplate: instanceTemplate.SelfLink,
					Name:             pulumi.String("primary"),
				},
			},
			StandbyPolicy: &compute.InstanceGroupManagerStandbyPolicyArgs{
				Mode: pulumi.String("MANUAL"),
			},
			UpdatePolicy: &compute.InstanceGroupManagerUpdatePolicyArgs{
				MinimalAction:     pulumi.String("REPLACE"),
				Type:              pulumi.String("PROACTIVE"),
				MaxSurgeFixed:     pulumi.Int(0),
				ReplacementMethod: pulumi.String("RECREATE"),
			},
			NamedPorts: compute.InstanceGroupManagerNamedPortArray{
				&compute.InstanceGroupManagerNamedPortArgs{
					Name: pulumi.String("https"),
					Port: pulumi.Int(443),
				},
			},
		})
		if err != nil {
			return err
		}

		devBackendService, err := compute.NewBackendService(ctx, fmt.Sprintf("%s-dev-backend", COMPUTE_INSTANCE_NAME.Value()), &compute.BackendServiceArgs{
			Name:         pulumi.String(""),
			Protocol:     pulumi.String("HTTPS"),
			PortName:     pulumi.String("https"),
			HealthChecks: instanceGroupManager.SelfLink,
			Backends: compute.BackendServiceBackendArray{
				compute.BackendServiceBackendArgs{
					Group: instanceGroupManager.SelfLink,
				},
			},
		})
		if err != nil {
			return err
		}

		defaultURLMap, err := compute.NewURLMap(ctx, fmt.Sprintf("%s-dev-url-map", COMPUTE_INSTANCE_NAME.Value()), &compute.URLMapArgs{
			Name:           pulumi.String(fmt.Sprintf("%s-dev-url-map", COMPUTE_INSTANCE_NAME.Value())),
			DefaultService: devBackendService.ID(),
			HostRules: compute.URLMapHostRuleArray{
				&compute.URLMapHostRuleArgs{
					Hosts: pulumi.StringArray{
						pulumi.String("*"),
					},
					PathMatcher: pulumi.String("allpaths"),
				},
			},
			PathMatchers: compute.URLMapPathMatcherArray{
				&compute.URLMapPathMatcherArgs{
					Name:           pulumi.String("allpaths"),
					DefaultService: devBackendService.ID(),
					PathRules: compute.URLMapPathMatcherPathRuleArray{
						&compute.URLMapPathMatcherPathRuleArgs{
							Paths: pulumi.StringArray{
								pulumi.String("/*"),
							},
							Service: devBackendService.ID(),
						},
					},
				},
			},
		})
		if err != nil {
			return err
		}

		defaultTargetHttpProxy, err := compute.NewTargetHttpProxy(ctx, fmt.Sprintf("%s-dev-proxy", COMPUTE_INSTANCE_NAME.Value()), &compute.TargetHttpProxyArgs{
			Name:   pulumi.String(fmt.Sprintf("%s-dev-proxy", COMPUTE_INSTANCE_NAME.Value())),
			UrlMap: defaultURLMap.ID(),
		})
		if err != nil {
			return err
		}

		globalForwardingRule, err := compute.NewGlobalForwardingRule(ctx, fmt.Sprintf("%s-dev-lb", COMPUTE_INSTANCE_NAME.Value()), &compute.GlobalForwardingRuleArgs{
			Name:                pulumi.String(fmt.Sprintf("%s-dev-lb", COMPUTE_INSTANCE_NAME.Value())),
			Target:              defaultTargetHttpProxy.ID(),
			PortRange:           pulumi.String("443"),
			LoadBalancingScheme: pulumi.String("EXTERNAL_MANAGED"),
		})
		if err != nil {
			return err
		}

		ctx.Export("staticAddress", static.Address)
		ctx.Export("globalForwardingRuleAddress", globalForwardingRule.IpAddress)

		_, err = cloudflare.NewRecord(ctx, fmt.Sprintf("%s-api-dev", COMPUTE_INSTANCE_NAME.Value()), &cloudflare.RecordArgs{
			ZoneId:  pulumi.String(CLOUDFLARE_ZONE_ID.Value()),
			Name:    pulumi.String("imigresen-api-dev"),
			Content: globalForwardingRule.IpAddress,
			Type:    pulumi.String("A"),
			Proxied: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		return nil
	}

	pulumi.Run(func(ctx *pulumi.Context) error {
		err := setupDev(ctx)
		if err != nil {
			return err
		}

		_, err = cloudflare.NewRecord(ctx, fmt.Sprintf("%s-client", COMPUTE_INSTANCE_NAME.Value()), &cloudflare.RecordArgs{
			ZoneId:  pulumi.String(CLOUDFLARE_ZONE_ID.Value()),
			Name:    pulumi.String("@"),
			Content: pulumi.String("imigresen.pages.dev"),
			Type:    pulumi.String("CNAME"),
			Proxied: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		_, err = cloudflare.NewRecord(ctx, fmt.Sprintf("%s-client-dev", COMPUTE_INSTANCE_NAME.Value()), &cloudflare.RecordArgs{
			ZoneId: pulumi.String(CLOUDFLARE_ZONE_ID.Value()),
			Name:   pulumi.String("dev"),
			// https://developers.cloudflare.com/pages/how-to/custom-branch-aliases/
			Content: pulumi.String("dev.imigresen.pages.dev"),
			Type:    pulumi.String("CNAME"),
			Proxied: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		return nil
	})
}
