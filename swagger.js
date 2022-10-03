const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

//API meta info
const options = {
    definition: {
        openapi: "3.0.0",
        info: { 
            title: "Banking App Middleware", 
            description: " An API to simulate users signing up for a banking application, creating bank accounts and making transactions from the created accounts",
            version: "1.0.0"
        },
        servers: [
            {
                url: "http://localhost:8000/api/v1"
            }
        ]
    },
    apis: ["./routes/user.routes.js", "./routes/auth.routes.js", "./SCHEMA/user.schema.js"]
}

// Docs in JSON format
const swaggerSpec = swaggerJSDoc(options);

//Serve swagger docs function
const swaggerDocs = ( app, port) => {
    // route to docs
    app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    app.get( "/api/v1/docs.json", ( req, res) => {
        res.setHeader( "Content-Type", "application/json")
        res.send( swaggerSpec)
    })

    console.log(
        `Version 1 Docs are available on http://localhost:${port}/api/v1/docs`
    );
}

module.exports = { swaggerDocs}