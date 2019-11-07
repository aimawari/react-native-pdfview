require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "@aimawari/react-native-pdfview"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  @aimawari/react-native-pdfview
                   DESC
  s.homepage     = "https://github.com/aimawari/react-native-pdfview"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "aimawari" => "aimawari.ai@gmail.com" }
  s.platforms    = { :ios => "9.0", :tvos => "10.0" }
  s.source       = { :git => "https://github.com/aimawari/react-native-pdfview.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.swift_version = "4.2"
  s.requires_arc = true

  s.dependency "React"
	
  # s.dependency "..."
end

