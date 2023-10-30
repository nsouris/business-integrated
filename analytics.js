import appInsights from "applicationinsights";

appInsights
  .setup(
    "InstrumentationKey=f7beedc1-54b5-45f4-aaa5-e3b55e87a16d;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/"
  )
  .start();
