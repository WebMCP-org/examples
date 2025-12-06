# frozen_string_literal: true

#
# Bookmarks controller for the Rails WebMCP example
#
# This is a reference implementation showing how to structure
# the Rails controller. The actual WebMCP tools are handled
# client-side via Stimulus controllers for this demo.
#
# In a production app, you might want server-side persistence
# and would use this controller for CRUD operations.
#
class BookmarksController < ApplicationController
  before_action :set_bookmark, only: %i[show update destroy]

  # GET /bookmarks
  # Displays the bookmarks index page with WebMCP integration
  def index
    @bookmarks = Bookmark.recent

    # Apply tag filter if provided
    @bookmarks = @bookmarks.by_tag(params[:tag]) if params[:tag].present?

    # Apply search if provided
    @bookmarks = @bookmarks.search(params[:q]) if params[:q].present?

    respond_to do |format|
      format.html
      format.json { render json: @bookmarks }
    end
  end

  # GET /bookmarks/:id
  def show
    respond_to do |format|
      format.html
      format.json { render json: @bookmark }
    end
  end

  # POST /bookmarks
  def create
    @bookmark = Bookmark.new(bookmark_params)

    if @bookmark.save
      respond_to do |format|
        format.html { redirect_to bookmarks_path, notice: "Bookmark created." }
        format.json { render json: @bookmark, status: :created }
      end
    else
      respond_to do |format|
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @bookmark.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /bookmarks/:id
  def update
    if @bookmark.update(bookmark_params)
      respond_to do |format|
        format.html { redirect_to bookmarks_path, notice: "Bookmark updated." }
        format.json { render json: @bookmark }
      end
    else
      respond_to do |format|
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @bookmark.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /bookmarks/:id
  def destroy
    @bookmark.destroy

    respond_to do |format|
      format.html { redirect_to bookmarks_path, notice: "Bookmark deleted." }
      format.json { head :no_content }
    end
  end

  # GET /bookmarks/stats
  # Returns statistics about bookmarks
  def stats
    bookmarks = Bookmark.all
    all_tags = bookmarks.flat_map(&:tags)
    tag_counts = all_tags.tally.sort_by { |_, count| -count }.first(5)

    stats = {
      total: bookmarks.count,
      unique_tags: all_tags.uniq.count,
      top_tags: tag_counts.map { |tag, count| { tag: tag, count: count } }
    }

    render json: stats
  end

  private

  def set_bookmark
    @bookmark = Bookmark.find(params[:id])
  end

  def bookmark_params
    params.require(:bookmark).permit(:title, :url, :description, tags: [])
  end
end
