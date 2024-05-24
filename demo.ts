import { generateTS } from "./src/generateTS/index";

async function fetch() {
  try {
    const res = await generateTS({
      token: "***REMOVED***",
      apiKey: "***REMOVED***",
      environment: "development",
      region: "US",
      tokenType: "delivery",
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

fetch();
