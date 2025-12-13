#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    tray::SystemTrayMenu, tray::SystemTrayMenuItem, tray::SystemTray, Menu, MenuItem,
    Submenu, SystemTrayEvent,
};
use std::path::PathBuf;

#[tauri::command]
async fn show_notification(title: String, body: String) {
    println!("Notification: {} - {}", title, body);
}

#[tauri::command]
async fn open_file_dialog() -> Result<Option<PathBuf>, String> {
    use tauri::api::dialog;

    match dialog::blocking::FileDialogBuilder::new()
        .pick_folder(None)
    {
        Ok(path) => Ok(path),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
async fn check_for_updates() -> Result<bool, String> {
    // Placeholder for update checking logic
    Ok(false)
}

fn main() {
    let tray_menu = SystemTrayMenu::new()
        .add_item(SystemTrayMenuItem::new("Show", true))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(SystemTrayMenuItem::new("Quit", true));

    let tray = SystemTray::new().with_menu(tray_menu);

    let app_menu = Menu::new()
        .add_submenu(Submenu::new(
            "File",
            Menu::new()
                .add_native_item(MenuItem::Quit),
        ))
        .add_submenu(Submenu::new(
            "Edit",
            Menu::new()
                .add_native_item(MenuItem::Undo)
                .add_native_item(MenuItem::Redo)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Cut)
                .add_native_item(MenuItem::Copy)
                .add_native_item(MenuItem::Paste),
        ));

    tauri::Builder::default()
        .menu(app_menu)
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main");
                if let Some(window) = window {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show" => {
                        let window = app.get_window("main");
                        if let Some(window) = window {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            show_notification,
            open_file_dialog,
            get_app_version,
            check_for_updates,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
