a = raw_input("Enter the String here : ")

count = 0

for i in range(0,len(a)):
	if(a[i]==" "):
		count = count+1

print count +1