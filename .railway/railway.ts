import {
  defineRailway,
  github,
  preserve,
  project,
  service,
  volume,
} from "railway/iac";

const productionRegion = "us-east4-eqdc4a";

export default defineRailway((context) => {
  const sqliteData = volume("sqlite-data", {
    region: productionRegion,
    sizeMB: 512,
  });

  const web = service("web", {
    source: github("Threepwood98/friends-coffee", {
      branch: "main",
      checkSuites: true,
    }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "Dockerfile",
    },
    healthcheck: "/api/health",
    healthcheckTimeout: 300,
    replicas: {
      [productionRegion]: 1,
    },
    env: {
      DATABASE_URL: "file:/data/app.db",
      BETTER_AUTH_SECRET: preserve(),
      BETTER_AUTH_URL: "https://${{ RAILWAY_PUBLIC_DOMAIN }}",
      NEXT_PUBLIC_SITE_URL: "https://${{ RAILWAY_PUBLIC_DOMAIN }}",
      ADMIN_EMAIL: preserve(),
      ADMIN_PASSWORD: preserve(),
      GOOGLE_CLIENT_ID: preserve(),
      GOOGLE_CLIENT_SECRET: preserve(),
      CLOUDINARY_CLOUD_NAME: preserve(),
      CLOUDINARY_API_KEY: preserve(),
      CLOUDINARY_API_SECRET: preserve(),
    },
    volumeMounts: {
      "/data": sqliteData,
    },
  });

  return project(context.projectName ?? "friends-coffee", {
    resources: [web, sqliteData],
  });
});
