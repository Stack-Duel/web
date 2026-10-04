(function () {
  "use strict";

  var React = window.__AlgowarsReact;
  var ReactDOMClient = window.__AlgowarsReactDOMClient;

  var INCOMING_MESSAGE_TYPE = "algowars-preview-code";
  var READY_MESSAGE_TYPE = "algowars-preview-ready";
  var MAIN_MODULE_KEY = "__main__";

  var errorEl = document.getElementById("algowars-preview-error");
  var rootEl = document.getElementById("algowars-preview-root");
  var reactRoot = ReactDOMClient.createRoot(rootEl);
  var renderCount = 0;

  function showError(err) {
    var message = err?.stack ? err.stack : String(err);
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }

  // React's createRoot does not rethrow a component's render error back to
  // the caller of `.render()` when there's no error boundary above it — it
  // reports the error via `reportError`/a window "error" event instead.
  // Catching it here (React's own supported mechanism) is what lets it reach
  // the preview UI.
  function PreviewErrorBoundary(props) {
    React.Component.call(this, props);
    this.state = { hasError: false };
  }
  PreviewErrorBoundary.prototype = Object.create(React.Component.prototype);
  PreviewErrorBoundary.getDerivedStateFromError = function () {
    return { hasError: true };
  };
  PreviewErrorBoundary.prototype.componentDidCatch = function (error) {
    this.props.onError(error);
  };
  PreviewErrorBoundary.prototype.render = function () {
    if (this.state.hasError) return null;
    return this.props.children;
  };

  function transpile(source, filename) {
    return (
      Babel.transform(source, {
        presets: [
          ["react", { runtime: "classic", pragma: "React.createElement" }],
        ],
        filename: filename,
      }).code || ""
    );
  }

  // Strips a leading "./" and any extension, so "./RecordItem.jsx",
  // "./RecordItem", and "RecordItem" all resolve to the same key — matching
  // how Node's own require() resolves files by basename regardless of the
  // extension the requiring code did or didn't spell out.
  function normalizePath(path) {
    return path.replace(/^\.\//, "").replace(/\.(jsx|tsx|js|ts)$/, "");
  }

  // A small hand-rolled CommonJS loader: since every file is already known
  // upfront (no network resolution needed, only relative paths between the
  // user's own files), this is simpler and far lighter than pulling in a real
  // bundler for the preview. Modules are cached by key so requiring the same
  // file twice returns the same instance, matching Node's semantics.
  function createRequire(sources) {
    var cache = {};

    function requireFn(spec) {
      if (spec === "react") return React;

      var key = normalizePath(spec);
      if (cache[key]) return cache[key].exports;

      var source = sources[key];
      if (source === undefined) {
        throw new Error('Cannot find module "' + spec + '".');
      }

      var moduleObj = { exports: {} };
      cache[key] = moduleObj;

      var factory = new Function(
        "module",
        "exports",
        "require",
        "React",
        source
      );
      factory(moduleObj, moduleObj.exports, requireFn, React);

      return moduleObj.exports;
    }

    return requireFn;
  }

  function renderCode(code, functionName, props, additionalFiles) {
    try {
      // Matches the grader's convention exactly: a bare function/declaration
      // named `functionName`, no export needed on the main file — the same
      // code that gets submitted also renders here. Additional files export
      // themselves explicitly (`module.exports.X = X`), same as the backend.
      var mainSource =
        transpile(code, "solution.jsx") +
        "\nmodule.exports.default = " +
        functionName +
        ";\n";

      var sources = {};
      sources[MAIN_MODULE_KEY] = mainSource;
      (additionalFiles || []).forEach(function (file) {
        sources[normalizePath(file.path)] = transpile(file.content, file.path);
      });

      var require = createRequire(sources);
      var mainExports = require(MAIN_MODULE_KEY);

      var Component = mainExports.default;
      if (typeof Component !== "function") {
        throw new TypeError(
          'No component named "' + functionName + '" was found in your code.'
        );
      }

      renderCount += 1;
      clearError();
      reactRoot.render(
        React.createElement(
          PreviewErrorBoundary,
          { key: renderCount, onError: showError },
          React.createElement(Component, props)
        )
      );
    } catch (err) {
      showError(err);
    }
  }

  var expectedOrigin = (function () {
    try {
      return document.referrer ? new URL(document.referrer).origin : null;
    } catch {
      return null;
    }
  })();

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    if (expectedOrigin && event.origin !== expectedOrigin) return;
    if (
      typeof event.data !== "object" ||
      event.data === null ||
      event.data.type !== INCOMING_MESSAGE_TYPE
    ) {
      return;
    }
    renderCode(
      String(event.data.code || ""),
      String(event.data.functionName || ""),
      event.data.props || {},
      event.data.additionalFiles
    );
  });

  window.addEventListener("error", function (event) {
    event.preventDefault();
    showError(event.error || event.message);
  });

  window.addEventListener("unhandledrejection", function (event) {
    event.preventDefault();
    showError(event.reason);
  });

  window.parent.postMessage(
    { type: READY_MESSAGE_TYPE },
    expectedOrigin || "*"
  );
})();
