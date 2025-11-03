/**
 * Test script to explore what data is available from the EIA API
 */

async function testEIAAPI() {
  const apiKey = process.env.EIA_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: EIA_API_KEY environment variable is required.");
    process.exit(1);
  }

  console.log("🔍 Testing EIA API endpoints...\n");

  // Test 1: Get available facets
  console.log("1️⃣ Checking available facets for petroleum/pri/gnd...");
  try {
    const facetsUrl = `https://api.eia.gov/v2/petroleum/pri/gnd/facets/?api_key=${apiKey}`;
    const response = await fetch(facetsUrl);
    const data: unknown = await response.json();
    console.log("Available facets:", JSON.stringify(data, null, 2));
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }

  // Test 2: Get some data without filters
  console.log("2️⃣ Getting sample data without filters...");
  try {
    const dataUrl = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${apiKey}&frequency=weekly&data[0]=value&length=5`;
    const response = await fetch(dataUrl);
    const data: unknown = await response.json();
    console.log("Sample data:", JSON.stringify(data, null, 2));
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }

  // Test 3: Try with process filter
  console.log("3️⃣ Testing with process=PTE (retail)...");
  try {
    const dataUrl = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${apiKey}&frequency=weekly&data[0]=value&facets[process][]=PTE&length=5`;
    const response = await fetch(dataUrl);
    const data: unknown = await response.json();
    console.log("With process filter:", JSON.stringify(data, null, 2));
    console.log("\n");
  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

void testEIAAPI();

