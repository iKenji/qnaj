#
# Cookbook Name:: time-zone
# Recipe:: default
#
# Copyright 2017, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#

execute "change localtime to JST" do
  user "root"
  command <<-EOC
  cp -p /usr/share/zoneinfo/Japan /etc/localtime
  echo 'ZONE="Asia/Tokyo"' > /etc/sysconfig/clock
  echo 'UTC=false' >> /etc/sysconfig/clock
  EOC
end

cookbook_file "/etc/sysconfig/clock" do
  owner "root"
  group "root"
  mode 0755
  source "clock-utc"
end
