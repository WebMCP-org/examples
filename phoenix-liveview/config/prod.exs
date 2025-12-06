import Config

config :webmcp_demo, WebmcpDemoWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json"

config :logger, level: :info
