defmodule WebmcpDemoWeb.CounterLive do
  @moduledoc """
  LiveView demonstrating WebMCP integration with Phoenix.

  This LiveView exposes server-side state to AI agents through WebMCP tools.
  The JavaScript hook registers tools that communicate with LiveView via events.
  """
  use WebmcpDemoWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:count, 0)
     |> assign(:items, [])
     |> assign(:notifications, [])
     |> assign(:last_action, nil)}
  end

  @impl true
  def handle_event("increment", _params, socket) do
    new_count = socket.assigns.count + 1
    {:noreply, socket |> assign(:count, new_count) |> assign(:last_action, "incremented")}
  end

  @impl true
  def handle_event("decrement", _params, socket) do
    new_count = max(0, socket.assigns.count - 1)
    {:noreply, socket |> assign(:count, new_count) |> assign(:last_action, "decremented")}
  end

  @impl true
  def handle_event("set_count", %{"value" => value}, socket) do
    case Integer.parse(to_string(value)) do
      {num, _} when num >= 0 ->
        {:noreply, socket |> assign(:count, num) |> assign(:last_action, "set to #{num}")}

      _ ->
        {:noreply, push_notification(socket, :error, "Invalid count value")}
    end
  end

  @impl true
  def handle_event("add_item", %{"name" => name}, socket) when byte_size(name) > 0 do
    item = %{
      id: System.unique_integer([:positive]),
      name: name,
      created_at: DateTime.utc_now()
    }

    items = socket.assigns.items ++ [item]

    {:noreply,
     socket
     |> assign(:items, items)
     |> assign(:last_action, "added item: #{name}")
     |> push_notification(:success, "Added: #{name}")}
  end

  def handle_event("add_item", _params, socket) do
    {:noreply, push_notification(socket, :error, "Item name cannot be empty")}
  end

  @impl true
  def handle_event("remove_item", %{"id" => id}, socket) do
    id = if is_binary(id), do: String.to_integer(id), else: id
    {removed, items} = Enum.split_with(socket.assigns.items, &(&1.id == id))

    case removed do
      [item] ->
        {:noreply,
         socket
         |> assign(:items, items)
         |> assign(:last_action, "removed item: #{item.name}")
         |> push_notification(:success, "Removed: #{item.name}")}

      [] ->
        {:noreply, push_notification(socket, :error, "Item not found")}
    end
  end

  @impl true
  def handle_event("clear_items", _params, socket) do
    count = length(socket.assigns.items)

    {:noreply,
     socket
     |> assign(:items, [])
     |> assign(:last_action, "cleared #{count} items")
     |> push_notification(:success, "Cleared #{count} items")}
  end

  @impl true
  def handle_event("dismiss_notification", %{"index" => index}, socket) do
    index = if is_binary(index), do: String.to_integer(index), else: index
    notifications = List.delete_at(socket.assigns.notifications, index)
    {:noreply, assign(socket, :notifications, notifications)}
  end

  @impl true
  def handle_event("get_state", _params, socket) do
    state = %{
      count: socket.assigns.count,
      items: Enum.map(socket.assigns.items, &Map.take(&1, [:id, :name])),
      item_count: length(socket.assigns.items),
      last_action: socket.assigns.last_action
    }

    {:reply, {:ok, state}, socket}
  end

  defp push_notification(socket, type, message) do
    notification = %{type: type, message: message, id: System.unique_integer([:positive])}
    notifications = socket.assigns.notifications ++ [notification]
    assign(socket, :notifications, notifications)
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div id="webmcp-app" phx-hook="WebMCP" class="app">
      <header class="header">
        <h1>Phoenix LiveView + WebMCP</h1>
        <p class="subtitle">AI-powered server-side state management</p>
      </header>

      <div class="notifications">
        <%= for {notification, index} <- Enum.with_index(@notifications) do %>
          <div class={"notification notification-#{notification.type}"}>
            <%= notification.message %>
            <button
              phx-click="dismiss_notification"
              phx-value-index={index}
              class="dismiss-btn"
            >
              &times;
            </button>
          </div>
        <% end %>
      </div>

      <div class="content">
        <section class="info-section">
          <div class="info-card">
            <h2>How This Works</h2>
            <p>
              This app exposes server-side state to AI agents via WebMCP:
            </p>
            <ul>
              <li>Connect any WebMCP-compatible client</li>
              <li>Discover 6 tools for counter and item management</li>
              <li>AI controls trigger LiveView events</li>
              <li>Server state syncs to UI in real-time</li>
            </ul>
          </div>

          <div class="tools-card">
            <h2>Available Tools</h2>
            <ul>
              <li><code>increment_counter</code> - Increase count by 1</li>
              <li><code>decrement_counter</code> - Decrease count by 1</li>
              <li><code>set_counter</code> - Set count to specific value</li>
              <li><code>add_item</code> - Add item to list</li>
              <li><code>remove_item</code> - Remove item by ID</li>
              <li><code>get_state</code> - Get current state</li>
            </ul>
          </div>
        </section>

        <section class="counter-section">
          <div class="card counter-card">
            <h2>Counter</h2>
            <div class="counter-display">
              <span class="count"><%= @count %></span>
            </div>
            <div class="counter-controls">
              <button phx-click="decrement" class="btn btn-secondary">-</button>
              <button phx-click="increment" class="btn btn-primary">+</button>
            </div>
            <%= if @last_action do %>
              <p class="last-action">Last action: <%= @last_action %></p>
            <% end %>
          </div>
        </section>

        <section class="items-section">
          <div class="card items-card">
            <h2>Items (<%= length(@items) %>)</h2>
            <%= if Enum.empty?(@items) do %>
              <p class="empty-state">No items yet. Use add_item tool to add some.</p>
            <% else %>
              <ul class="items-list">
                <%= for item <- @items do %>
                  <li class="item">
                    <span class="item-name"><%= item.name %></span>
                    <span class="item-id">#<%= item.id %></span>
                    <button
                      phx-click="remove_item"
                      phx-value-id={item.id}
                      class="btn btn-danger btn-small"
                    >
                      Remove
                    </button>
                  </li>
                <% end %>
              </ul>
              <button phx-click="clear_items" class="btn btn-secondary">Clear All</button>
            <% end %>
          </div>
        </section>
      </div>

      <footer class="footer">
        <p>
          Built with
          <a href="https://docs.mcp-b.ai" target="_blank" rel="noopener noreferrer">WebMCP</a>
          &bull; Phoenix LiveView &bull; Elixir
        </p>
      </footer>
    </div>
    """
  end
end
