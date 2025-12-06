defmodule WebmcpDemo.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      WebmcpDemoWeb.Telemetry,
      {Phoenix.PubSub, name: WebmcpDemo.PubSub},
      WebmcpDemoWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: WebmcpDemo.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    WebmcpDemoWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
