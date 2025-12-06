defmodule WebmcpDemoWeb.Router do
  use WebmcpDemoWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {WebmcpDemoWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  scope "/", WebmcpDemoWeb do
    pipe_through :browser

    live "/", CounterLive, :index
  end
end
