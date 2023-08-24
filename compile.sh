if ! command -v typst &>/dev/null; then
	echo "typst ekki sett upp, hægt að sjá á https://typst.app"
	exit
fi

for file in papers/src/*; do
	arrIN=(${file//\// })
	file_name=${arrIN[2]//\.typ/}
	typst compile --root papers "$file" "papers/dist/$file_name.pdf"
done
