defmodule WebmcpDemoWeb.CoreComponents do
  @moduledoc """
  Core UI components for the WebMCP demo.
  """
  use Phoenix.Component

  @doc """
  Renders a notification message.
  """
  attr :type, :atom, default: :info, values: [:info, :success, :warning, :error]
  attr :message, :string, required: true

  def notification(assigns) do
    ~H"""
    <div class={"notification notification-#{@type}"}>
      <%= @message %>
    </div>
    """
  end

  @doc """
  Renders a button.
  """
  attr :type, :string, default: "button"
  attr :class, :string, default: ""
  attr :rest, :global
  slot :inner_block, required: true

  def button(assigns) do
    ~H"""
    <button type={@type} class={"btn #{@class}"} {@rest}>
      <%= render_slot(@inner_block) %>
    </button>
    """
  end

  @doc """
  Renders a card component.
  """
  attr :class, :string, default: ""
  slot :inner_block, required: true

  def card(assigns) do
    ~H"""
    <div class={"card #{@class}"}>
      <%= render_slot(@inner_block) %>
    </div>
    """
  end
end
