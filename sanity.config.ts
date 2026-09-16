import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { NotifyEnrollmentAction } from "./sanity/actions/enrollmentStatusActions";
import { NotifyAbonoAction } from "./sanity/actions/abonoActions";

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
  document: {
    actions: (prev, context) => {
      if (context.schemaType !== "enrollment") return prev;
      return [NotifyEnrollmentAction, NotifyAbonoAction, ...prev];
    },
  },
});
