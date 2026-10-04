import type { Extension } from "@uiw/react-codemirror";

const languageExtensionLoadersByName: Record<string, () => Promise<Extension>> =
  {
    javascript: async () => {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ jsx: true });
    },
    react: async () => {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ jsx: true });
    },
    "vanilla js": async () => {
      const { javascript } = await import("@codemirror/lang-javascript");
      const extension = javascript();
      return { ...extension, options: [] };
    },
    typescript: async () => {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ jsx: true, typescript: true });
    },
    python: async () => {
      const { python } = await import("@codemirror/lang-python");
      return python();
    },
    java: async () => {
      const { java } = await import("@codemirror/lang-java");
      return java();
    },
    "c++": async () => {
      const { cpp } = await import("@codemirror/lang-cpp");
      return cpp();
    },
  };

const languageExtensionByNameCache = new Map<string, Promise<Extension[]>>();

export const getLanguageExtensionsByName = async (
  languageName: string
): Promise<Extension[]> => {
  const key = languageName.trim().toLowerCase();
  const loader = languageExtensionLoadersByName[key];

  if (!loader) {
    return [];
  }

  const cached = languageExtensionByNameCache.get(key);
  if (cached) {
    return cached;
  }

  const loadPromise = loader().then((extension) => [extension]);
  languageExtensionByNameCache.set(key, loadPromise);

  return loadPromise;
};
