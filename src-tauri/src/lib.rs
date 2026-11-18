// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// Tauri backend entry point and platform-specific system drive detection commands.

/// Formats an uppercase ASCII drive letter into a normalized Windows root path (e.g., "C:/").
pub fn format_windows_drive_root(letter: char) -> String {
    return format!("{}:/", letter.to_ascii_uppercase());
}

/// Checks whether a Linux mount point and filesystem type represent a user-browsable drive.
pub fn is_browsable_linux_mount(device: &str, mount_point: &str, fs_type: &str) -> bool {
    if fs_type == "squashfs" || fs_type == "swap" || fs_type == "autofs" {
        return false;
    }

    if mount_point == "/" {
        return true;
    }

    let excluded_prefixes = ["/snap", "/var/snap", "/boot", "/proc", "/sys", "/dev"];
    if excluded_prefixes
        .iter()
        .any(|prefix| mount_point.starts_with(prefix))
    {
        return false;
    }
    if mount_point.starts_with("/run") && !mount_point.starts_with("/run/media/") {
        return false;
    }

    let is_user_mount_dir = mount_point.starts_with("/media/")
        || mount_point.starts_with("/run/media/")
        || mount_point.starts_with("/mnt/");

    let is_block_device = device.starts_with("/dev/sd")
        || device.starts_with("/dev/nvme")
        || device.starts_with("/dev/vd")
        || device.starts_with("/dev/mmcblk")
        || device.starts_with("/dev/mapper/");

    return is_user_mount_dir || is_block_device;
}

/// Parses Linux `/proc/mounts` content into deduplicated, unescaped mount paths.
pub fn parse_linux_mounts(proc_mounts_content: &str) -> Vec<String> {
    let mut drives = vec!["/".to_string()];

    for line in proc_mounts_content.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 3 {
            continue;
        }

        let device = parts[0];
        let raw_mount_point = parts[1].replace("\\040", " ");
        let fs_type = parts[2];

        if is_browsable_linux_mount(device, &raw_mount_point, fs_type)
            && !drives.contains(&raw_mount_point)
        {
            drives.push(raw_mount_point);
        }
    }

    return drives;
}

/// Checks whether an Android `/storage/<name>` path is a removable SD card or USB OTG volume.
pub fn is_external_android_storage_volume(mount_point: &str) -> bool {
    if !mount_point.starts_with("/storage/") {
        return false;
    }
    let remainder = &mount_point["/storage/".len()..];
    if remainder.is_empty() || remainder.contains('/') {
        return false;
    }
    return remainder != "emulated" && remainder != "self";
}

/// Parses Android `/proc/mounts` content for Internal Storage and removable SD/OTG volumes.
pub fn parse_android_mounts(proc_mounts_content: &str) -> Vec<String> {
    let mut drives = vec!["/storage/emulated/0".to_string()];

    for line in proc_mounts_content.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let raw_mount_point = parts[1].replace("\\040", " ");
        if is_external_android_storage_volume(&raw_mount_point)
            && !drives.contains(&raw_mount_point)
        {
            drives.push(raw_mount_point);
        }
    }

    return drives;
}

#[cfg(target_os = "windows")]
pub fn detect_system_drives() -> Vec<String> {
    let mut drives = Vec::new();
    for byte in b'A'..=b'Z' {
        let root = format_windows_drive_root(byte as char);
        if std::path::Path::new(&root).exists() {
            drives.push(root);
        }
    }
    return drives;
}

#[cfg(target_os = "linux")]
pub fn detect_system_drives() -> Vec<String> {
    if let Ok(content) = std::fs::read_to_string("/proc/mounts") {
        let parsed = parse_linux_mounts(&content);
        let existing: Vec<String> = parsed
            .into_iter()
            .filter(|path| std::path::Path::new(path).exists())
            .collect();
        if !existing.is_empty() {
            return existing;
        }
    }
    return vec!["/".to_string()];
}

#[cfg(target_os = "android")]
pub fn detect_system_drives() -> Vec<String> {
    let mut drives = if let Ok(content) = std::fs::read_to_string("/proc/mounts") {
        parse_android_mounts(&content)
    } else {
        vec!["/storage/emulated/0".to_string()]
    };

    if let Ok(entries) = std::fs::read_dir("/storage") {
        for entry in entries.flatten() {
            let path_string = entry.path().to_string_lossy().replace('\\', "/");
            if is_external_android_storage_volume(&path_string) && !drives.contains(&path_string) {
                drives.push(path_string);
            }
        }
    }

    return drives;
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "android")))]
pub fn detect_system_drives() -> Vec<String> {
    return Vec::new();
}

/// Returns available OS drives and registers each drive in the Tauri FS security scope.
#[tauri::command]
fn list_system_drives(app: tauri::AppHandle) -> Vec<String> {
    let drives = detect_system_drives();

    #[cfg(any(target_os = "windows", target_os = "linux", target_os = "android"))]
    {
        use tauri_plugin_fs::FsExt;
        let scope = app.fs_scope();
        for drive in &drives {
            let _ = scope.allow_directory(drive, true);
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "android")))]
    let _ = &app;

    return drives;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_system_drives])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn formats_windows_drive_root_with_trailing_slash() {
        assert_eq!(format_windows_drive_root('c'), "C:/");
        assert_eq!(format_windows_drive_root('E'), "E:/");
    }

    #[test]
    fn parses_ubuntu_linux_proc_mounts_and_filters_system_pseudofs() {
        let sample_mounts = "\
sysfs /sys sysfs rw,nosuid,nodev,noexec,relatime 0 0
/dev/nvme0n1p2 / ext4 rw,relatime 0 0
/dev/nvme0n1p1 /boot/efi vfat rw,relatime 0 0
/dev/loop0 /snap/core22/864 squashfs ro,nodev,relatime 0 0
/dev/sda1 /media/ubuntu/My\\040Passport exfat rw,nosuid,nodev 0 0
/dev/sdb1 /mnt/work_ssd ext4 rw,relatime 0 0
";
        let drives = parse_linux_mounts(sample_mounts);
        assert_eq!(
            drives,
            vec!["/", "/media/ubuntu/My Passport", "/mnt/work_ssd"]
        );
    }

    #[test]
    fn parses_android_storage_mounts_including_internal_and_sd_card() {
        let sample_android_mounts = "\
/dev/fuse /storage/emulated fuse rw,nosuid,nodev 0 0
tmpfs /storage/self tmpfs rw,nosuid,nodev 0 0
/dev/block/vold/public:179,65 /storage/1A2B-3C4D vfat rw,dirsync,nosuid,nodev 0 0
";
        let drives = parse_android_mounts(sample_android_mounts);
        assert_eq!(drives, vec!["/storage/emulated/0", "/storage/1A2B-3C4D"]);
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn detects_at_least_one_mounted_windows_drive() {
        let drives = detect_system_drives();
        assert!(!drives.is_empty());
        assert!(drives.iter().all(|d| d.ends_with(":/")));
    }
}
