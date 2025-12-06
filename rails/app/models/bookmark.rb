# frozen_string_literal: true

#
# Bookmark model for storing saved URLs
#
# This is a reference implementation showing how to structure
# the Rails model for use with WebMCP tools.
#
# Database schema (for reference):
#   create_table :bookmarks do |t|
#     t.string :title, null: false
#     t.string :url, null: false
#     t.text :description
#     t.string :tags, array: true, default: []
#     t.timestamps
#   end
#
class Bookmark < ApplicationRecord
  # Validations
  validates :title, presence: true, length: { maximum: 255 }
  validates :url, presence: true, format: { with: URI::DEFAULT_PARSER.make_regexp }

  # Scopes for filtering
  scope :by_tag, ->(tag) { where("? = ANY(tags)", tag) }
  scope :recent, -> { order(created_at: :desc) }

  # Search scope for finding bookmarks by text
  scope :search, ->(query) {
    where(
      "title ILIKE :q OR description ILIKE :q OR url ILIKE :q",
      q: "%#{query}%"
    )
  }

  # Normalize URL before saving
  before_validation :normalize_url

  # Convert to JSON format expected by the frontend
  def as_json(options = {})
    super(options.merge(
      only: [:id, :title, :url, :description, :tags, :created_at]
    )).tap do |hash|
      hash["createdAt"] = hash.delete("created_at")&.iso8601
    end
  end

  private

  def normalize_url
    return if url.blank?

    # Add https:// if no protocol specified
    self.url = "https://#{url}" unless url.match?(%r{\Ahttps?://})
  end
end
