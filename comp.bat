@echo off
del dist.zip /Q
del debug.zip /Q
del log.txt /Q
rd dist /s /Q
xcopy source dist\source /I /s

FOR %%G IN (source\js\*.js) DO (
	echo: >> log.txt
	echo  ### processing  %%G >> log.txt
	java -jar yuicompressor.jar --type js %%G -o dist\%%G -v --charset utf-8 2>>log.txt
)

FOR %%G IN (source\css\*.css) DO (
	echo: >> log.txt
	echo ### processing %%G >> log.txt
	java -jar yuicompressor.jar --type css %%G -o dist\%%G -v --charset utf-8 2>>log.txt
)

echo: >> log.txt
echo ### compressing dist >> log.txt
"C:\Program Files\7-Zip\7z.exe" -tzip -mx=9 a dist.zip .\dist\source\* 2>>log.txt 

echo: >> log.txt
echo ### compressing debug >> log.txt
"C:\Program Files\7-Zip\7z.exe" -tzip -mx=9 a debug.zip .\source\* 2>>log.txt 

rd dist /s /Q

rem chrome --pack-extension=%CD%\source --pack-extension-key=%CD%\source.pem

cat log.txt