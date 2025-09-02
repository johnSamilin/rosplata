@@ .. @@
 // @ts-check
-import { AuthManager } from "../shared/lib/auth"
-import { Router } from "../shared/lib/router"
-import { importStyle } from "../shared/lib/imports"
+import { AuthManager } from "../shared/lib/auth.mjs"
+import { Router } from "../shared/lib/router.mjs"
+import { importStyle } from "../shared/lib/imports.mjs"
 
 importStyle('/src/app/styles/index.css')
@@ .. @@
 const errorHandler = (error) => {
-    import('../shared/lib/crisis-manager').then(({ CrisisManager }) => {
+    import('../shared/lib/crisis-manager.mjs').then(({ CrisisManager }) => {
         CrisisManager.logError(error)
     })
 }