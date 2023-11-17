import appInsights from 'applicationinsights';

appInsights
  .setup(
    'InstrumentationKey=3407c758-105f-433c-b937-e56198ec8bdd;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/'
  )
  .setAutoCollectConsole(true, true)
  .start();
