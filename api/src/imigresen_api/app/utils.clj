(ns imigresen-api.app.utils)

(defmacro comptime [form & args]
  (if (ifn? form)
    (apply (resolve (symbol form)) args)
    form))

(defmacro caught [form & args]
  (if (ifn? form)
    `(try (~form ~@args) (catch Exception e# e#))
    `(try ~form (catch Exception e# e#))))
