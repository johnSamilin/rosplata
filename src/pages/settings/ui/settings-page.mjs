@@ .. @@
 //@ts-check
-import { AnimatedComponent } from '../../../shared/ui/base'
-import { importStyle } from '../../../shared/lib/imports'
-import { MenuWidget } from '../../../widgets/menu'
-import { Router } from '../../../shared/lib/router'
+import { AnimatedComponent } from '../../../shared/ui/base.mjs'
+import { importStyle } from '../../../shared/lib/imports.mjs'
+import { MenuWidget } from '../../../widgets/menu/index.mjs'
+import { Router } from '../../../shared/lib/router.mjs'
@@ .. @@
     renderContentTo(contentContainer) {
         if (Router.routeParams.section === 'features') {
-            import('../../../widgets/features').then(({ FeaturesWidget }) => {
+            import('../../../widgets/features/index.mjs').then(({ FeaturesWidget }) => {
                 featuresController = new FeaturesWidget()
                 featuresController.renderTo(contentContainer?.querySelector('#layout-settings__settings'))
             })
         } else {
-            import('../../../widgets/settings').then(({ SettingsWidget }) => {
+            import('../../../widgets/settings/index.mjs').then(({ SettingsWidget }) => {
                 settingsController = new SettingsWidget()
                 settingsController.renderTo(contentContainer?.querySelector('#layout-settings__settings'))
             })
@@ .. @@
         } catch (er) {
-            import('../../../shared/lib/crisis-manager').then(({ CrisisManager }) => {
+            import('../../../shared/lib/crisis-manager.mjs').then(({ CrisisManager }) => {
                 CrisisManager.logError(er)
             })
         } finally {