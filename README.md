> [!NOTE]
> This project is still under development.

A CLI tool that lets you test GRUB2 themes without having to reboot your computer. It uses QEMU to launch an extremely
lightweight virtual machine, optimized to run smoothly even on low-end hardware.

## Installation

There are two distributions available: a compiled binary, which can be downloaded from
the [GitHub Releases](https://github.com/HarukaYamamoto0/grubtheme-cli/releases) page, and an npm package published
as [grubtheme](https://www.npmjs.com/package/grubtheme).

| Package Manager | Command                    |
|-----------------|----------------------------|
| Bun             | `bun add -g grubtheme`     |
| npm             | `npm install -g grubtheme` |

### System Dependencies

The project relies on several system utilities to create and manage disk images, install GRUB2, and run virtual
machines. These dependencies must be installed separately, regardless of which distribution method you choose.

On Debian-based distributions, such as Ubuntu and Linux Mint, you can install all required dependencies using:

```shell
sudo apt install \
  qemu-system-x86 qemu-utils \
  parted util-linux mount e2fsprogs \
  grub-pc-bin grub2-common
```

These packages provide the following components:

| Package           | Purpose                                                         |
|-------------------|-----------------------------------------------------------------|
| `qemu-system-x86` | Runs the virtual machine.                                       |
| `qemu-utils`      | Creates and manages disk images using `qemu-img`.               |
| `parted`          | Creates the partition table and bootable partition.             |
| `util-linux`      | Provides `losetup` for managing loop devices.                   |
| `mount`           | Provides the utilities for mounting and unmounting filesystems. |
| `e2fsprogs`       | Formats partitions with the EXT2 filesystem.                    |
| `grub-pc-bin`     | Provides the GRUB2 BIOS bootloader components.                  |
| `grub2-common`    | Provides GRUB2 utilities, including `grub-install`.             |

> [!IMPORTANT]
> The current implementation supports Linux only. Preparing disk images requires elevated privileges to manage loop
devices, mount filesystems, and install GRUB2.

## Usage

First, you need to create a disk image that QEMU will use.

```shell
grubtheme image create
```

This creates a disk image at `~/.local/share/grubtheme/images/preview.img`.

Next, you need to prepare the image by creating the necessary partitions, formatting the filesystem, and installing
GRUB2.

```shell
grubtheme image prepare
```

Now, launch QEMU by specifying the directory containing your GRUB2 theme. You can also optionally specify the screen
resolution that GRUB will use.

```shell
grubtheme preview ~/Downloads/Stardew-Valley --resolution 1280x720
```

This launches QEMU and boots directly into GRUB, allowing you to preview and test your themes without rebooting your
computer.

Once the initial setup is complete, you only need to use the `preview` command with the path to the theme you want to
test.

## How It Works

The underlying implementation is relatively straightforward. It follows this sequence of operations:

1. Create a base disk image in `RAW` format.
2. Create a partition table and a bootable partition.
3. Attach the disk image to a loop device.
4. Format the partition with an EXT2 filesystem.
5. Mount the filesystem at `/mnt/grub-qemu-mounted`.
    - Install GRUB2.
    - Configure the `grub.cfg` file.
    - Copy the theme into the disk image.
6. Unmount the filesystem.
7. Detach the loop device.
8. Launch QEMU using the prepared disk image as its virtual disk.

In other words, the project brings together several system-level components and orchestrates them to provide a simple
way to test GRUB2 themes.

## Contributing

Contributions are always welcome!

Even if the project appears inactive from time to time, as long as I'm still around, I'll gladly review any issues or
pull requests you open.

At the moment, I have two main goals for the project.

The first is to develop a filesystem driver capable of reading and writing directly to the disk image, eliminating the
need for mounting filesystems and managing loop devices. This would also make it possible to eventually port the project
to Windows and macOS, although implementing such a driver is considerably more complex.

The second is to improve error handling throughout the project. I want to ensure that unexpected failures and specific
edge cases are handled properly, with clear and meaningful error messages instead of obscure system-level errors.

## Known Issues

### `unaligned pointer`

```text
unaligned pointer 0x50e00028
Aborted. Press any key to exit.
```

This error typically occurs when GRUB attempts to load a corrupted or incompatible font file used by the theme.

The issue has been observed with certain fonts, such as `Heiti` and `Xiangsu`, obtained from GRUB themes available
online.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.