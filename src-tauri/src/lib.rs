// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// Tauri backend entry point and platform-specific system drive detection commands.

/// Formats an uppercase ASCII drive letter into a normalized Windows root path (e.g., "C:/").
pub fn format_windows_drive_root(letter: char) -> String {
    format!("{}:/", letter.to_ascii_uppercase())
}

/// Detects mounted drive roots on Windows (A:/ through Z:/). Returns empty on other OSes for now.
pub fn detect_system_drives() -> Vec<String> {
    #[cfg(target_os = "windows")]
    {
        let mut drives = Vec::new();
        for byte in b'A'..=b'Z' {
            let root = format_windows_drive_root(byte as char);
            if std::path::Path::new(&root).exists() {
                drives.push(root);
            }
        }
        drives
    }

    #[cfg(not(target_os = "windows"))]
    {
        Vec::new()
    }
}

/// Returns available OS drives and registers each drive in the Tauri FS security scope.
#[tauri::command]
fn list_system_drives(app: tauri::AppHandle) -> Vec<String> {
    let drives = detect_system_drives();

    #[cfg(target_os = "windows")]
    {
        use tauri_plugin_fs::FsExt;
        let scope = app.fs_scope();
        for drive in &drives {
            let _ = scope.allow_directory(drive, true);
        }
    }

    #[cfg(not(target_os = "windows"))]
    let _ = &app;

    drives
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

    #[cfg(target_os = "windows")]
    #[test]
    fn detects_at_least_one_mounted_windows_drive() {
        let drives = detect_system_drives();
        assert!(!drives.is_empty());
        assert!(drives.iter().all(|d| d.ends_with(":/")));
    }
}
