#text to html
import re
from termcolor import colored
from sys import argv

script,filename = argv
	
print "Copy text file here : "
text = open (filename)
#print text.read()
a = ["<html>","<title>","<base>","<link>","<meta>","<script>","<style>""<html>",
	"</title>","</base>","</link>","</meta>","</script>","</style>","</html>"]

list = []
#print text.read().split()

count = 0
for word in text.read().split():
	#for word in a:
	if(word in a):
		#list.append(word)
		word = colored(word,"red")
		list.append(word)
	else:
		list.append(word)
		
print list
print re.findall(r'[<.*>][.*][</.*>]',list)

		


