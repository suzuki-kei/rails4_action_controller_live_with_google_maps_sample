class IndexController < ApplicationController

  include ActionController::Live

  def index
  end

  def markers
    response.header['Content-Type'] = 'text/event-stream'

    latitude = Range.new(*[params[:north], params[:south]].sort)
    longitude = Range.new(*[params[:east], params[:west]].sort)
    exclude_ids = params[:excludes].to_s.split(',')

    Marker.where(latitude: latitude, longitude: longitude).where.not(id: exclude_ids).each do |marker|
      logger.debug(marker.inspect)
      response.stream.write("event: marker\n")
      response.stream.write("data: #{marker.attributes.to_json}\n\n")
      sleep 0.1
    end

    response.stream.write("event: done\n")
    response.stream.write("data: bye\n\n")
  rescue IOError
    # クライアント側から close された場合の例外は無視する.
  ensure
    response.stream.close
  end

end

