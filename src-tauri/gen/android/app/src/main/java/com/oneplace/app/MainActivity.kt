package com.oneplace.app

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  private fun findWebView(root: View?): WebView? {
    if (root is WebView) return root
    if (root is ViewGroup) {
      for (i in 0 until root.childCount) {
        val found = findWebView(root.getChildAt(i))
        if (found != null) return found
      }
    }
    return null
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    onBackPressedDispatcher.addCallback(
      this,
      object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          val webView = findWebView(window.decorView)
          if (webView == null) {
            isEnabled = false
            onBackPressedDispatcher.onBackPressed()
            isEnabled = true
            return
          }

          webView.evaluateJavascript(
            "(function(){return window.__ONE_PLACE_HANDLE_BACK__ ? Boolean(window.__ONE_PLACE_HANDLE_BACK__()) : false;})()"
          ) { result ->
            if (result != "true") {
              isEnabled = false
              onBackPressedDispatcher.onBackPressed()
              isEnabled = true
            }
          }
        }
      }
    )
  }
}
