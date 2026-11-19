
terraform {
  required_providers {
    libvirt = {
      source  = "dmacvicar/libvirt"
      version = "0.8.3"
    }
  }
}

provider "libvirt" {
  uri = "qemu:///system"
}

# Configuracoes gerais
variable "pool_name" {
  description = "Pool exclusivo da avaliacao"
  type        = string
  default     = "avaliacao_devops_pool"
}

variable "pool_path" {
  description = "Diretorio exclusivo para os discos"
  type        = string
  default     = "/var/lib/libvirt/images/avaliacao-devops-produtos"
}

variable "base_image_path" {
  description = "Imagem Ubuntu 24.04 baixada para a avaliacao"
  type        = string
  default     = "/var/lib/libvirt/images/avaliacao-devops-produtos/ubuntu-24.04-base.img"
}

locals {
  ssh_public_key = trimspace(
    file(pathexpand("~/.ssh/id_ed25519.pub"))
  )
}

# Pool exclusivo da avaliacao
resource "libvirt_pool" "avaliacao" {
  name = var.pool_name
  type = "dir"

  target {
    path = var.pool_path
  }
}

# Imagem-base Ubuntu 24.04
resource "libvirt_volume" "ubuntu_base" {
  name   = "avaliacao-ubuntu-24.04-base.qcow2"
  pool   = libvirt_pool.avaliacao.name
  source = var.base_image_path
  format = "qcow2"
}

# Disco da VM1
resource "libvirt_volume" "vm1_disk" {
  name           = "avaliacao-vm1-disco.qcow2"
  pool           = libvirt_pool.avaliacao.name
  base_volume_id = libvirt_volume.ubuntu_base.id
  size           = 15 * 1024 * 1024 * 1024
}

# Disco da VM2
resource "libvirt_volume" "vm2_disk" {
  name           = "avaliacao-vm2-disco.qcow2"
  pool           = libvirt_pool.avaliacao.name
  base_volume_id = libvirt_volume.ubuntu_base.id
  size           = 20 * 1024 * 1024 * 1024
}

# Cloud-init da VM1
resource "libvirt_cloudinit_disk" "vm1_cloudinit" {
  name = "avaliacao-vm1-cloudinit.iso"
  pool = libvirt_pool.avaliacao.name

  user_data = templatefile("${path.module}/cloud_init.cfg", {
    hostname       = "avaliacao-vm1"
    ssh_public_key = local.ssh_public_key
  })
}

# Cloud-init da VM2
resource "libvirt_cloudinit_disk" "vm2_cloudinit" {
  name = "avaliacao-vm2-cloudinit.iso"
  pool = libvirt_pool.avaliacao.name

  user_data = templatefile("${path.module}/cloud_init.cfg", {
    hostname       = "avaliacao-vm2"
    ssh_public_key = local.ssh_public_key
  })
}

# VM1 - Aplicacao Web
resource "libvirt_domain" "vm1" {
  name   = "avaliacao-vm1"
  memory = 2048
  vcpu   = 2

  cloudinit = libvirt_cloudinit_disk.vm1_cloudinit.id

  disk {
    volume_id = libvirt_volume.vm1_disk.id
  }

  network_interface {
    network_name   = "default"
    wait_for_lease = true
  }

  autostart = true
}

# VM2 - API Node.js e MySQL
resource "libvirt_domain" "vm2" {
  name   = "avaliacao-vm2"
  memory = 3072
  vcpu   = 2

  cloudinit = libvirt_cloudinit_disk.vm2_cloudinit.id

  disk {
    volume_id = libvirt_volume.vm2_disk.id
  }

  network_interface {
    network_name   = "default"
    wait_for_lease = true
  }

  autostart = true
}

# IP da VM1
output "vm1_ip" {
  description = "Endereco IP da aplicacao web"
  value       = try(libvirt_domain.vm1.network_interface[0].addresses[0], "IP ainda nao disponivel")
}

# IP da VM2
output "vm2_ip" {
  description = "Endereco IP da API e do MySQL"
  value       = try(libvirt_domain.vm2.network_interface[0].addresses[0], "IP ainda nao disponivel")
}
