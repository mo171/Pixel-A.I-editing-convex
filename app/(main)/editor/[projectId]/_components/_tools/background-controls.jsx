"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trash2,
  Palette,
  Image as ImageIcon,
  Search,
  Download,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useCanvas } from "@/context/context";
import { FabricImage } from "fabric";

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

export function BackgroundControls({ project }) {
  const { canvasEditor, processingMessage, setProcessingMessage } = useCanvas();
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [searchQuery, setSearchQuery] = useState("");
  const [unsplashImages, setUnsplashImages] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isApplyingAI, setIsApplyingAI] = useState(false);

  // Get the main image object from canvas (consistent with other tools)
  const getMainImage = () => {
    if (!canvasEditor) return null;
    const objects = canvasEditor.getObjects();
    // Get the last added image (most recent, including AI modifications)
    const images = objects.filter((obj) => obj.type === "image");
    return images[images.length - 1] || null;
  };

  // Background removal using ImageKit
  const handleBackgroundRemoval = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !project) return;

    setProcessingMessage("Removing background with AI...");

    try {
      // Get the current image URL
      const currentImageUrl =
        mainImage.getSrc?.() || mainImage._element?.src || mainImage.src;

      // Create ImageKit transformation URL for background removal (clean base URL)
      const bgRemovedUrl = currentImageUrl.includes("ik.imagekit.io")
        ? `${currentImageUrl.split("?")[0]}?tr=e-bgremove`
        : currentImageUrl;

      // Create new image with background removed
      const processedImage = await FabricImage.fromURL(bgRemovedUrl, {
        crossOrigin: "anonymous",
      });

      // Store the current properties before removing the old image
      const currentProps = {
        left: mainImage.left,
        top: mainImage.top,
        scaleX: mainImage.scaleX,
        scaleY: mainImage.scaleY,
        angle: mainImage.angle,
        originX: mainImage.originX,
        originY: mainImage.originY,
      };

      // Remove the old image and add the new one
      canvasEditor.remove(mainImage);
      processedImage.set(currentProps);
      canvasEditor.add(processedImage);

      // IMPORTANT: Update coordinates after replacing the image
      processedImage.setCoords();

      // Set as active object and recalculate canvas offset
      canvasEditor.setActiveObject(processedImage);
      canvasEditor.calcOffset();
      canvasEditor.requestRenderAll();

      console.log("Background removed successfully");
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Failed to remove background. Please try again.");
    } finally {
      setProcessingMessage(null);
    }
  };

  // AI Background Replacement using ImageKit
  const handleAIBackgroundReplacement = async () => {
    const mainImage = getMainImage();
    if (!mainImage || !project || !aiPrompt.trim()) return;

    setIsApplyingAI(true);
    setProcessingMessage("Generating AI background...");

    try {
      // Get the current image URL
      const currentImageUrl =
        mainImage.getSrc?.() || mainImage._element?.src || mainImage.src;

      // Create enhanced prompt with natural-looking additions
      const enhancedPrompt = `${aiPrompt.trim()}, photorealistic, natural lighting, high quality, detailed`;
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      
      let aiReplacedUrl;
      if (currentImageUrl.includes("ik.imagekit.io")) {
        const [baseUrl] = currentImageUrl.split("?");
        aiReplacedUrl = `${baseUrl}?tr=e-changebg-prompt-${encodedPrompt}`;
      } else {
        aiReplacedUrl = currentImageUrl; // Fallback if not ImageKit URL
      }

      console.log("Original URL:", currentImageUrl);
      console.log("Enhanced Prompt:", enhancedPrompt);
      console.log("AI Background URL:", aiReplacedUrl);

      // Create new image with AI-generated background
      const processedImage = await FabricImage.fromURL(aiReplacedUrl, {
        crossOrigin: "anonymous",
      });

      // Store the current properties before removing the old image
      const currentProps = {
        left: mainImage.left,
        top: mainImage.top,
        scaleX: mainImage.scaleX,
        scaleY: mainImage.scaleY,
        angle: mainImage.angle,
        originX: mainImage.originX,
        originY: mainImage.originY,
        selectable: true,
        evented: true,
      };

      // Replace image on canvas
      canvasEditor.remove(mainImage);
      processedImage.set(currentProps);
      canvasEditor.add(processedImage);
      processedImage.setCoords();
      canvasEditor.setActiveObject(processedImage);
      canvasEditor.calcOffset();
      canvasEditor.requestRenderAll();

      console.log("AI background replacement successful");
      
    } catch (error) {
      console.error("Error applying AI background replacement:", error);
      alert("Failed to generate AI background. Please try again.");
    } finally {
      setIsApplyingAI(false);
      setProcessingMessage(null);
    }
  };

  // Set canvas background color
  const handleColorBackground = () => {
    if (!canvasEditor) return;

    // In Fabric.js 6.7, set property directly and render
    canvasEditor.backgroundColor = backgroundColor;
    canvasEditor.requestRenderAll();
  };

  // Remove canvas background (both color and image)
  const handleRemoveBackground = () => {
    if (!canvasEditor) return;

    // Clear both background color and image
    canvasEditor.backgroundColor = null;
    canvasEditor.backgroundImage = null;
    canvasEditor.requestRenderAll();
  };

  // Search Unsplash images
  const searchUnsplashImages = async () => {
    if (!searchQuery.trim() || !UNSPLASH_ACCESS_KEY) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to search images");

      const data = await response.json();
      setUnsplashImages(data.results || []);
    } catch (error) {
      console.error("Error searching Unsplash:", error);
      alert("Failed to search images. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Set image as canvas background
  const handleImageBackground = async (imageUrl, imageId) => {
    if (!canvasEditor) return;

    setSelectedImageId(imageId);
    try {
      // Download and trigger Unsplash download endpoint (required by Unsplash API)
      if (UNSPLASH_ACCESS_KEY) {
        fetch(`${UNSPLASH_API_URL}/photos/${imageId}/download`, {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }).catch(() => {}); // Silent fail for download tracking
      }

      // Create fabric image from URL
      const fabricImage = await FabricImage.fromURL(imageUrl, {
        crossOrigin: "anonymous",
      });

      // USE PROJECT DIMENSIONS instead of canvas dimensions for proper scaling
      const canvasWidth = project.width; // Logical canvas width
      const canvasHeight = project.height; // Logical canvas height

      // Calculate scales
      const scaleX = canvasWidth / fabricImage.width;
      const scaleY = canvasHeight / fabricImage.height;

      // Use Math.max to FILL the entire canvas (ensures no empty space)
      const scale = Math.max(scaleX, scaleY);

      fabricImage.set({
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
        left: canvasWidth / 2, // Use project dimensions
        top: canvasHeight / 2, // Use project dimensions
      });

      // Set background and render
      canvasEditor.backgroundImage = fabricImage;
      canvasEditor.requestRenderAll();
      setSelectedImageId(null);

      console.log("Background set:", {
        imageSize: `${fabricImage.width}x${fabricImage.height}`,
        canvasSize: `${canvasWidth}x${canvasHeight}`,
        scale: scale,
        finalSize: `${fabricImage.width * scale}x${fabricImage.height * scale}`,
      });
    } catch (error) {
      console.error("Error setting background image:", error);
      alert("Failed to set background image. Please try again.");
      setSelectedImageId(null);
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      searchUnsplashImages();
    }
  };

  if (!canvasEditor) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">Canvas not ready</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative h-full">
      {/* AI Background Removal Button - Outside of tabs */}
      <div className="space-y-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-sm font-medium text-white mb-2">
            AI Background Removal
          </h3>
          <p className="text-xs text-white/70 mb-4">
            Automatically remove the background from your image using AI
          </p>
        </div>

        <Button
          onClick={handleBackgroundRemoval}
          disabled={processingMessage || isApplyingAI || !getMainImage()}
          className="w-full"
          variant="primary"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Image Background
        </Button>

        {!getMainImage() && (
          <p className="text-xs text-amber-400">
            Please add an image to the canvas first to remove its background
          </p>
        )}
      </div>

      {/* Shadcn UI Tabs */}
      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
          <TabsTrigger
            value="color"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs"
          >
            <Palette className="h-4 w-4 mr-1" />
            Color
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs"
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Image
          </TabsTrigger>
          <TabsTrigger
            value="ai-replace"
            className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Replace
          </TabsTrigger>
        </TabsList>

        {/* Color Background Tab */}
        <TabsContent value="color" className="space-y-4 mt-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">
              Solid Color Background
            </h3>
            <p className="text-xs text-white/70 mb-4">
              Choose a solid color for your canvas background
            </p>
          </div>

          <div className="space-y-4">
            <HexColorPicker
              color={backgroundColor}
              onChange={setBackgroundColor}
              style={{ width: "100%" }}
            />

            <div className="flex items-center gap-2">
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 bg-slate-700 border-white/20 text-white"
              />
              <div
                className="w-10 h-10 rounded border border-white/20"
                style={{ backgroundColor }}
              />
            </div>

            <Button
              onClick={handleColorBackground}
              className="w-full"
              variant="primary"
            >
              <Palette className="h-4 w-4 mr-2" />
              Apply Color
            </Button>
          </div>
        </TabsContent>

        {/* Image Background Tab */}
        <TabsContent value="image" className="space-y-4 mt-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">
              Image Background
            </h3>
            <p className="text-xs text-white/70 mb-4">
              Search and use high-quality images from Unsplash
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Search for backgrounds..."
              className="flex-1 bg-slate-700 border-white/20 text-white"
            />
            <Button
              onClick={searchUnsplashImages}
              disabled={isSearching || !searchQuery.trim()}
              variant="primary"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {unsplashImages?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">
                Search Results ({unsplashImages?.length})
              </h4>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {unsplashImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400 transition-colors"
                    onClick={() =>
                      handleImageBackground(image.urls.regular, image.id)
                    }
                  >
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || "Background image"}
                      className="w-full h-24 object-cover"
                    />

                    {/* Loading overlay */}
                    {selectedImageId === image.id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Download className="h-5 w-5 text-white" />
                    </div>

                    {/* Attribution */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                      <p className="text-xs text-white/80 truncate">
                        by {image.user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isSearching && unsplashImages?.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70 text-sm">
                No images found for "{searchQuery}"
              </p>
              <p className="text-white/50 text-xs">
                Try a different search term
              </p>
            </div>
          )}

          {/* Initial state */}
          {!searchQuery && unsplashImages?.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70 text-sm">
                Search for background images
              </p>
              <p className="text-white/50 text-xs">Powered by Unsplash</p>
            </div>
          )}

          {/* API key warning */}
          {!UNSPLASH_ACCESS_KEY && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-amber-400 text-xs">
                Unsplash API key not configured. Please add
                NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to your environment variables.
              </p>
            </div>
          )}
        </TabsContent>

        {/* NEW: AI Background Replacement Tab */}
        <TabsContent value="ai-replace" className="space-y-4 mt-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-2">
              AI Background Replacement
            </h3>
            <p className="text-xs text-white/70 mb-4">
              Describe what background you want and AI will generate it
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-white">AI Background Generator</span>
                <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                  NEW
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/70 mb-2 block">
                    Describe your desired background
                  </label>
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., sunset beach, office workspace, mountain landscape..."
                    className="bg-slate-700 border-white/20 text-white placeholder-white/50"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && aiPrompt.trim() && !isApplyingAI) {
                        handleAIBackgroundReplacement();
                      }
                    }}
                  />
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-xs text-white/70">
                    <strong>Pro tips:</strong><br />
                    • Be specific: "modern office with plants" vs "office"<br />
                    • Include lighting: "bright", "sunset", "soft lighting"<br />
                    • Add atmosphere: "cozy", "professional", "vibrant"
                  </p>
                </div>

                <Button
                  onClick={handleAIBackgroundReplacement}
                  disabled={!aiPrompt.trim() || isApplyingAI || processingMessage || !getMainImage()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  variant="primary"
                >
                  {isApplyingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Background...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Background
                    </>
                  )}
                </Button>

                {!getMainImage() && (
                  <p className="text-xs text-amber-400">
                    Please add an image to the canvas first to replace its background
                  </p>
                )}
              </div>
            </div>

            {/* Example prompts */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/90">Quick Examples:</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Sunset beach with palm trees",
                  "Modern office workspace", 
                  "Cozy coffee shop interior",
                  "Mountain landscape at dawn"
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setAiPrompt(example)}
                    className="text-left p-2 text-xs bg-slate-700/50 hover:bg-slate-700 rounded border border-white/10 hover:border-purple-400/50 transition-colors"
                  >
                    <span className="text-white/90">"{example}"</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Clear Canvas Background Button - At the bottom */}
      <div className="pt-4 border-t border-white/10 bottom-0 w-full">
        <Button
          onClick={handleRemoveBackground}
          className="w-full"
          variant="outline"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Canvas Background
        </Button>
      </div>
    </div>
  );
}
