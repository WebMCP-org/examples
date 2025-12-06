import Config

config :webmcp_demo, WebmcpDemoWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "webmcp_demo_dev_secret_key_base_that_is_at_least_64_bytes_long_for_security",
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:webmcp_demo, ~w(--sourcemap=inline --watch)]},
    tailwind: {Tailwind, :install_and_run, [:webmcp_demo, ~w(--watch)]}
  ]

config :webmcp_demo, WebmcpDemoWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/(?!uploads/).*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"lib/webmcp_demo_web/(controllers|live|components)/.*(ex|heex)$"
    ]
  ]

config :webmcp_demo, dev_routes: true

config :logger, :console, format: "[$level] $message\n"

config :phoenix, :stacktrace_depth, 20

config :phoenix, :plug_init_mode, :runtime
