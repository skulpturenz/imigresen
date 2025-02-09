(ns imigresen-api.api.user.req)

(defn ->GET [req]
  (let [{{{:keys [kc-id]} :path} :parameters} req]
    kc-id))

(defn ->POST [req]
  (let [{{:keys [body]} :parameters} req]
    body))

(defn ->PATCH [req]
  (let [{{:keys [body]} :parameters} req]
    body))

(defn ->DELETE [req]
  (let [{{{:keys [uuid]} :path} :parameters} req]
    uuid))
