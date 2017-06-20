Vagrant.configure("2") do |config|

  config.vm.box = "bento/centos-7.3"
  config.vm.network "private_network", ip: "192.168.33.33"
  # config.vm.network "public_network"
  # config.vm.network "forwarded_port", guest: 3000, host: 3000
  # config.vm.network "forwarded_port", guest: 4567, host: 4567
  # config.vm.network "forwarded_port", guest: 80, host: 9080

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
  end

  config.omnibus.chef_version = "12.20.3"
  config.berkshelf.enabled = true
  config.berkshelf.berksfile_path = "chef-repo/Berksfile" 

  config.vm.provision "shell", run: "always", inline: "systemctl restart network.service"

  config.vm.provision "chef_zero" do |chef|
    chef.cookbooks_path = ["chef-repo/cookbooks", "chef-repo/site-cookbooks"]
    chef.nodes_path = "chef-repo/nodes"
    chef.roles_path  = "chef-repo/roles"
    chef.data_bags_path = "chef-repo/data_bags"
    chef.environments_path = "chef-repo/environments"
    chef.environment = "vagrant"

    chef.add_recipe "yum"
    chef.add_role("base")
    chef.add_role("web")
    chef.add_role("db")
    chef.add_role("cache")
  end
end
