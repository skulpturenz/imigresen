(ns imigresen-api.app.utils)

(defmacro caught [form & args]
  (if (ifn? form)
    `(try (~form ~@args) (catch Exception e# e#))
    `(try ~form (catch Exception e# e#))))

(defn exception? [x] (isa? (class x) Exception))

(defn truthy [& args]
  (first (filter some? args)))
