class CreateMarkers < ActiveRecord::Migration

  def change
    create_table :markers do |table|
      # 名前.
      table.string :name, null: false

      # 緯度.
      table.decimal :latitude, null: false

      # 経度.
      table.decimal :longitude, null: false
    end
  end

end

