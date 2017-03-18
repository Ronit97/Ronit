from sys import argv

script, filename = argv
print "Hi there! Choose a option"
print "1) Open the File "
print "2) Erase the File "
print "3) Edit the File "
print "4) Save the File "

b = True

while(b):
	a = input("")
	if(a==1):
		print "Here's your file : "
	#open

		txt = open(filename)
		print "Here's Your file : %r" %filename
		print txt.read()

	elif(a==2):
	#erase the file
		target = open(filename,'w')
		target = truncate(filename)

	elif(a==3):
	#edit the file
	#Ask for line 1 and line 2 in the main function
		target = open(filename,'w')
		line1= raw_input("Line 1 : ")
		line2 = raw_input("Line 2 : ")
		target.write(line1)
		target.write(line2)

	elif(a==4):
	#save the file
		target.close()
		b=False


