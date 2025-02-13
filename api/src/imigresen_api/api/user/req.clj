(ns imigresen-api.api.user.req)

(defn ->GET [req]
  (let [{{{:keys [id]} :path} :parameters} req]
    id))

(defn ->POST [req]
  (let [{{:keys [body]} :parameters} req]
    body))

(defn ->PATCH [req]
  (let [{{:keys [body]} :parameters} req]
    body))

(defn ->DELETE [req]
  (let [{{{:keys [id]} :path} :parameters} req]
    id))
