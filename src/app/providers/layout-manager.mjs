@@ .. @@
 //@ts-check
 
-import { Store } from '../../shared/lib/store'
+import { Store } from '../../shared/lib/store.mjs'
 
 const topContainer = document.querySelector('#layout')
@@ .. @@
         switch (name) {
             case 'main':
-                const { MainPage } = await import('../../pages/main')
+                const { MainPage } = await import('../../pages/main/index.mjs')
                 layout = new MainPage()
                 break
             case 'settings':
-                const { SettingsPage } = await import('../../pages/settings')
+                const { SettingsPage } = await import('../../pages/settings/index.mjs')
                 layout = new SettingsPage()
                 break
             case 'login':
-                const { LoginPage } = await import('../../pages/login')
+                const { LoginPage } = await import('../../pages/login/index.mjs')
                 layout = new LoginPage()
                 break
         }