defmodule WebmcpDemoWeb.ErrorJSON do
  @moduledoc """
  Error JSON responses.
  """

  def render(template, _assigns) do
    %{errors: %{detail: Phoenix.Controller.status_message_from_template(template)}}
  end
end
