'use strict';

module.exports = mongoose => {
  const userSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    // It would be path to saved image in application.
    avatar: String,
    // It would be holder for data something like this: { user_id: [{message: '', direction: '', date: ''}] }
    history: { type: mongoose.Schema.Types.Mixed },
    isActive: Boolean,
    // We have bots and users.
    type: String,
    // We set this field for better bot management. Bot we don't need behavior for users. So by default it will be null.
    behavior: { type: String, default: null },
    description: { type: String, maxlength: 500 },
  }, {
    timestamps: true,
  });
  
  // If we have a lot of users we can set indexes.
  // Probably best solution would be to add index for field isActive.
  // What about history field? We save data with user_id, which provide us faster response to find chats with selected user.
  // So, probably, there is no need to index history field.
  // We'll use isActive a lot to find online users and show them in tabs
  userSchema.index({ isActive: 1 });
  
  // Here we use regular function syntax because Mongoose documentation http://mongoosejs.com/docs/guide.html#statics said:
  // Do not declare statics using ES6 arrow functions (=>). Arrow functions explicitly prevent binding this, so the above examples will not work because of the value of this.
  userSchema.statics.getActive = function () {
    // But to get result with less effort, we use Promises here and arrow function syntax to pass 'this' into resolve function.
    // We could use .bind or .apply to emulate same behavior, but really there is no need for them.
    return new Promise((resolve) => {
      resolve(this.find({ isActive: true }));
    });
  };
  
  return mongoose.model('User', userSchema);
};

