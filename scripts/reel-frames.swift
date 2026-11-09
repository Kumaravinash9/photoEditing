import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let input = CommandLine.arguments[1]
let outDir = CommandLine.arguments[2]
let count = Int(CommandLine.arguments[3]) ?? 10
let prefix = CommandLine.arguments[4]

let asset = AVURLAsset(url: URL(fileURLWithPath: input))
let seconds = CMTimeGetSeconds(asset.duration)
guard seconds.isFinite, seconds > 0 else {
  fputs("Could not read duration for \(input)\n", stderr)
  exit(1)
}

let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.maximumSize = CGSize(width: 420, height: 560)
generator.requestedTimeToleranceBefore = CMTime(seconds: 0.15, preferredTimescale: 600)
generator.requestedTimeToleranceAfter = CMTime(seconds: 0.15, preferredTimescale: 600)

try FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

for index in 0..<count {
  let fraction = (Double(index) + 0.5) / Double(count)
  let time = CMTime(seconds: min(seconds - 0.05, seconds * fraction), preferredTimescale: 600)
  let image = try generator.copyCGImage(at: time, actualTime: nil)
  let name = String(format: "%@-%02d.jpg", prefix, index + 1)
  let dest = URL(fileURLWithPath: outDir).appendingPathComponent(name)
  guard let destination = CGImageDestinationCreateWithURL(dest as CFURL, "public.jpeg" as CFString, 1, nil) else {
    fputs("Could not write \(name)\n", stderr)
    exit(1)
  }
  let options = [kCGImageDestinationLossyCompressionQuality: 0.72] as CFDictionary
  CGImageDestinationAddImage(destination, image, options)
  guard CGImageDestinationFinalize(destination) else {
    fputs("Could not finalize \(name)\n", stderr)
    exit(1)
  }
  print(name)
}
