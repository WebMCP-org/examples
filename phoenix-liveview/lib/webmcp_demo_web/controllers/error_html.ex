defmodule WebmcpDemoWeb.ErrorHTML do
  @moduledoc """
  Error HTML templates.
  """
  use WebmcpDemoWeb, :html

  def render(template, _assigns) do
    Phoenix.Controller.status_message_from_template(template)
  end
end
