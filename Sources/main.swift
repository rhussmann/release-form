import Kitura

// Create a new router
let router = Router()

// Handle static assets
router.all("/", middleware: StaticFileServer())

// Handle HTTP POST requests to /agree
router.all("/agree", middleware: BodyParser())
router.post("/agree") {
    request, response, next in
    guard let parsedBody = request.body else {
        next()
        return
    }

    switch(parsedBody) {
    case .urlEncoded(let formData):
        print(formData)
        let name = formData["first-name"] ?? ""
        try response.send("Hello \(name)").end()
    default:
        break
    }
    next()
}

// Add an HTTP server and connect it to the router
let port = 8090
Kitura.addHTTPServer(onPort: port, with: router)

// Start the Kitura runloop (this call never returns)
print("Starting on port \(port)")
Kitura.run()
