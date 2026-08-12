import path from "path";

const runnerFolder = path.join(__dirname, "..", "..", "..");
const rootNodeModules = path.join(runnerFolder, "..", "node_modules");

export default [
    {
        method: "GET",
        path: "/assets/{path*}",
        options: {
            handler: {
                directory: {
                    path: [
                        path.join(runnerFolder, "public", "static"),
                        path.join(runnerFolder, "public", "build"),
                        path.join(runnerFolder, "public", "assets", "images"),
                        path.join(
                            rootNodeModules,
                            "govuk-frontend",
                            "dist",
                            "govuk"
                        ),
                        path.join(
                            rootNodeModules,
                            "govuk-frontend",
                            "dist",
                            "govuk",
                            "assets",
                            "rebrand"
                        ),
                        path.join(
                            runnerFolder,
                            "node_modules",
                            "hmpo-components",
                            "assets"
                        ),
                    ],
                },
            },
        },
    },
];
