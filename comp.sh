for i in dist.zip debug.zip log.txt
do
	if [ -f "$i" ]
	then
		echo "Deleting old file $i..."
		rm "$i"
	fi
done

for i in dist
do
	if [ -d "$i" ]
	then
		echo "Deleting old dir $i..."
		rm -rf $i
	fi
done

mkdir "dist"
cp -R "./source" "./dist/"

echo "Processing javascript files..." | tee -a log.txt
#for i in ./source/js/*.js
for i in ./dist/source/js/*.js
do
	echo "### Processing $i" | tee -a log.txt
	java -jar yuicompressor.jar --type js "$i" -o "$i" -v --charset utf-8 2>>log.txt
	#java -jar closure.jar --compilation_level SIMPLE_OPTIMIZATIONS --language_in ECMASCRIPT5 --js "$i" --js_output_file "./dist/$i" 2>>log.txt
done

echo "Processing css files..." | tee -a log.txt
for i in ./dist/source/css/*.css
do
	echo "### Processing $i" | tee -a log.txt
	java -jar yuicompressor.jar --type css "$i" -o "$i" -v --charset utf-8 2>>log.txt
done

echo "Compressing dist" | tee -a log.txt
7z a -tzip -mx=9 dist.zip ./dist/source/* 2>>log.txt 

echo "Compressing debug" | tee -a log.txt
7z a -tzip -mx=9 debug.zip ./source/* 2>>log.txt 

rm -rf "dist"

less < log.txt
