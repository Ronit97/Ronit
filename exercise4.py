a = raw_input("Enter String : ")

for i in range (0,len(a)):
	if(a[i]==a[len(a)-1-i]):
		b=1
	else:
		b=0
		
if(b==1):
	print "palindrome"
else:
	print  "Not Palindrome"