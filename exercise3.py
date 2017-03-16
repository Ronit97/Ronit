a = raw_input("Enter a String : ")
count = 0

for i in range(0,len(a)):
	if (a[i]=="a" or a[i]=="e" or a[i]=="o" or a[i]=="u" or a[i]=="i"):
		count = count+1
		
print count