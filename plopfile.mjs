export default function (plop) {
  plop.setHelper("ifEquals", function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  plop.setHelper("titleCase", function (value) {
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });

  plop.setHelper("jsxBrace", function (value) {
    return `{${value}}`;
  });

  const domainPrompt = {
    type: "input",
    name: "domain",
    message: "Domain folder (e.g. problem, studio, user):",
    validate: (value) =>
      /^[a-z][a-z0-9-]*$/.test(value) || "Use lowercase, kebab-case",
  };

  const namePrompt = (message) => ({
    type: "input",
    name: "name",
    message,
    validate: (value) =>
      /^[a-z][a-z0-9-]*$/.test(value) || "Use lowercase, kebab-case",
  });

  plop.setGenerator("component", {
    description:
      "React component at an explicit path under a domain (Angular-CLI style: one path argument)",
    prompts: [
      {
        type: "input",
        name: "path",
        message:
          "Path: <domain>/.../<name>, e.g. studio/problems/problem/studio-problem-question or problem/my-search-input:",
        validate: (value) => {
          const segments = value.split("/").filter(Boolean);
          if (segments.length < 2) {
            return "Need at least <domain>/<name>";
          }
          if (!segments.every((s) => /^[a-z][a-z0-9-]*$/.test(s))) {
            return "Each path segment must be lowercase, kebab-case";
          }
          return true;
        },
      },
      {
        type: "confirm",
        name: "interactive",
        message:
          "Does it use hooks/state/event handlers (needs \"use client\")?",
        default: false,
      },
    ],
    actions: (answers) => {
      const segments = answers.path.split("/").filter(Boolean);
      answers.domain = segments[0];
      answers.name = segments[segments.length - 1];
      answers.featurePath = segments.slice(1, -1).join("/");

      return [
        {
          type: "add",
          path: "src/domains/{{domain}}/{{#if featurePath}}{{featurePath}}/{{/if}}{{kebabCase name}}.tsx",
          templateFile: "plop-templates/component.hbs",
        },
        {
          type: "add",
          path: "src/domains/{{domain}}/{{#if featurePath}}{{featurePath}}/{{/if}}{{kebabCase name}}.test.tsx",
          templateFile: "plop-templates/component.test.hbs",
        },
      ];
    },
  });

  plop.setGenerator("page", {
    description:
      "Server-component route entry under src/app that renders a client view/layout",
    prompts: [
      namePrompt("Page name, matches the view it renders (kebab-case, e.g. studio-problem):"),
      {
        type: "input",
        name: "route",
        message:
          "Route folder under src/app (e.g. studio/problems/[id]):",
      },
      {
        type: "input",
        name: "layoutImport",
        message:
          "Import path of the layout this page renders (e.g. @/domains/studio/problems/problem/studio-problem-layout):",
      },
      {
        type: "confirm",
        name: "hasParam",
        message: "Does the route have a dynamic segment (e.g. [id])?",
        default: true,
      },
      {
        type: "input",
        name: "paramName",
        message: "Param name (e.g. id):",
        default: "id",
        when: (answers) => answers.hasParam,
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/app/{{route}}/page.tsx",
        templateFile: "plop-templates/page.hbs",
      },
    ],
  });

  plop.setGenerator("api-query", {
    description: "GET endpoint + useQuery hook built on defineQuery",
    prompts: [
      domainPrompt,
      namePrompt("Resource name (kebab-case, e.g. studio-problem):"),
      {
        type: "input",
        name: "paramName",
        message: "Param name used to fetch it (e.g. id):",
        default: "id",
      },
      {
        type: "input",
        name: "model",
        message: "Returned model type name (e.g. Problem):",
      },
      {
        type: "input",
        name: "endpoint",
        message:
          "Endpoint template, use the param inline (e.g. /api/v1/studio/problems/${id}):",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/domains/{{domain}}/api/get-{{kebabCase name}}.ts",
        templateFile: "plop-templates/api-query.hbs",
      },
      {
        type: "add",
        path: "src/domains/{{domain}}/api/get-{{kebabCase name}}.test.ts",
        templateFile: "plop-templates/api-query.test.hbs",
      },
    ],
  });

  plop.setGenerator("api-mutation", {
    description: "Write endpoint + useMutation hook built on defineMutation",
    prompts: [
      domainPrompt,
      namePrompt("Mutation name (kebab-case, e.g. submit-problem-for-validation):"),
      {
        type: "list",
        name: "method",
        message: "HTTP method:",
        choices: ["post", "put", "patch", "delete"],
        default: "post",
      },
      {
        type: "input",
        name: "paramName",
        message: "Param name sent with the request (e.g. id):",
        default: "id",
      },
      {
        type: "input",
        name: "endpoint",
        message:
          "Endpoint template, use the param inline (e.g. /api/v1/problem/${id}/submit):",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/domains/{{domain}}/api/{{kebabCase name}}.ts",
        templateFile: "plop-templates/api-mutation.hbs",
      },
      {
        type: "add",
        path: "src/domains/{{domain}}/api/{{kebabCase name}}.test.ts",
        templateFile: "plop-templates/api-mutation.test.hbs",
      },
    ],
  });

  plop.setGenerator("model", {
    description: "TypeScript interface in a domain's models/ folder",
    prompts: [domainPrompt, namePrompt("Model name (kebab-case, e.g. problem-summary):")],
    actions: [
      {
        type: "add",
        path: "src/domains/{{domain}}/models/{{kebabCase name}}.ts",
        templateFile: "plop-templates/model.hbs",
      },
    ],
  });

  plop.setGenerator("hook", {
    description: "Standalone hook in a domain's hooks/ folder",
    prompts: [domainPrompt, namePrompt("Hook name without the use- prefix (e.g. pool-add-selection):")],
    actions: [
      {
        type: "add",
        path: "src/domains/{{domain}}/hooks/use-{{kebabCase name}}.ts",
        templateFile: "plop-templates/hook.hbs",
      },
      {
        type: "add",
        path: "src/domains/{{domain}}/hooks/use-{{kebabCase name}}.test.ts",
        templateFile: "plop-templates/hook.test.hbs",
      },
    ],
  });

  plop.setGenerator("view", {
    description:
      "Client page layout inside a domain folder (SidebarLayout + breadcrumb skeleton)",
    prompts: [
      domainPrompt,
      {
        type: "input",
        name: "featurePath",
        message:
          "Subfolder under the domain for this view, if any (e.g. problems/problem), leave blank for none:",
      },
      namePrompt("View name (kebab-case, e.g. studio-problem):"),
      {
        type: "input",
        name: "path",
        message: "Route path for the breadcrumb (e.g. /studio/problems):",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/domains/{{domain}}/{{#if featurePath}}{{featurePath}}/{{/if}}{{kebabCase name}}-layout.tsx",
        templateFile: "plop-templates/view.hbs",
      },
      {
        type: "add",
        path: "src/domains/{{domain}}/{{#if featurePath}}{{featurePath}}/{{/if}}{{kebabCase name}}-layout.test.tsx",
        templateFile: "plop-templates/view.test.hbs",
      },
      () =>
        "Reminder: wire this up under src/app/... with a thin async server component page.tsx that awaits params and renders this layout, and add the route to src/shared/router-config.ts.",
    ],
  });

  plop.setGenerator("route-error", {
    description: "Next.js error.tsx boundary for a route segment, built on ErrorCard",
    prompts: [
      namePrompt("Route name (kebab-case, e.g. studio-problem):"),
      {
        type: "input",
        name: "route",
        message: "Route folder under src/app (e.g. studio/problems/[id]):",
      },
      {
        type: "input",
        name: "homeHref",
        message: "Link href the error card's secondary button goes to (e.g. /studio/problems):",
      },
      {
        type: "input",
        name: "homeLabel",
        message: "Label for that button (e.g. My problems):",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/app/{{route}}/error.tsx",
        templateFile: "plop-templates/route-error.hbs",
      },
    ],
  });
}
