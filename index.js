const express= require('express');
const mongoose= require('mongoose');
const client = require('prom-client');


const app=express();
app.disable("x-powered-by");

const port=9000;
const url= "mongodb://db:27017";

mongoose.connect(url,{useNewUrlParser: true});
const con= mongoose.connection;
app.use(express.json());
try{
    con.on('open',() => {
        console.log('connected');
    })
}catch(error)
{
    console.log("Error: "+error);
}

const studentrouter= require("./routes/students");
app.use('/students',studentrouter)



// ================ Prometheus ==================

//Create a Registry to register the metrics
const register = new client.Registry();
client.collectDefaultMetrics({
    app: 'node-application-monitoring-app',
    prefix: 'node_',
    timeout: 10000,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});

// Create a registry and pull default metrics

app.get('/metrics', async (req, res) => {
    // Start the HTTP request timer, saving a reference to the returned method
    const end = httpRequestTimer.startTimer();
    // Save reference to the path so we can record it when ending the timer
    const route = req.route.path;
      
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  
    // End timer and add labels
    end({ route, code: res.statusCode, method: req.method });
  });

// 
app.get('/slow', async (req, res) => {
    const end = httpRequestTimer.startTimer();
    const route = req.route.path;
    await createDelayHandler(req, res);
    end({ route, code: res.statusCode, method: req.method });
  });

// Create a custom histogram metric
const httpRequestTimer = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
  });

// Register the histogram
  register.registerMetric(httpRequestTimer);


// Mock slow endpoint, waiting between 3 and 6 seconds to return a response
const createDelayHandler = async (req, res) => {
    if ((Math.floor(Math.random() * 100)) === 0) {
      throw new Error('Internal Error')
    }
    // Generate number between 3-6, then delay by a factor of 1000 (miliseconds)
    const delaySeconds = Math.floor(Math.random() * (6 - 3)) + 3
    await new Promise(res => setTimeout(res, delaySeconds * 1000))
    res.end('Slow url accessed!');
  };


app.listen(port, () =>{
    console.log('Server started');
})
