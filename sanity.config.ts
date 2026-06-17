import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { apiVersion, dataset, projectId } from "./sanity/env";

export default defineConfig({
  name: "ss-consultores",
  title: "SS Consultores CMS",
  projectId,
  dataset,
  basePath: "/studio",
  apiVersion,
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
