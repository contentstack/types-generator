import { generateTS } from "./src/generateTS/index";

async function fetch() {
  try {
    const res = await generateTS({
      token: "csbb041a11ccf2182c87d74b2d",
      apiKey: "bltb07d61d76cca54b3",
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
