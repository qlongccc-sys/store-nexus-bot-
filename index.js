const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits, 
  ChannelType 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.once('ready', () => {
  console.log(`Bot Store Nexus đã online thành công với tên: ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'create_ticket') {
    const channelName = `ticket-${interaction.user.username}`;
    
    const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
    if (existingChannel) {
      return interaction.reply({ content: `Bạn đã có một ticket đang mở tại ${existingChannel}!`, ephemeral: true });
    }

    const ticketChannel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('🛒 STORE NEXUS - HỖ TRỢ KHÁCH HÀNG')
      .setDescription(`Chào ${interaction.user}, vui lòng gửi yêu cầu hoặc bill thanh toán vào đây.\nStaff sẽ hỗ trợ bạn ngay lập tức!`)
      .addFields(
        { name: '💳 Ngân hàng', value: 'MB Bank', inline: true },
        { name: '🔢 STK', value: '`9920092010`', inline: true },
        { name: '👤 Chủ TK', value: 'Tran Quang Long', inline: true }
      );

    const staffRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_apple_id')
        .setLabel('✅ Xác Nhận Thanh Toán (Staff)')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('🔒 Đóng Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({ embeds: [ticketEmbed], components: [staffRow] });
    await interaction.reply({ content: `Đã tạo ticket hỗ trợ tại: ${ticketChannel}`, ephemeral: true });
  }

  if (interaction.customId === 'confirm_apple_id') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: 'Chỉ Staff mới có quyền bấm nút này!', ephemeral: true });
    }

    const appleIdEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('📲 THÔNG TIN TÀI KHOẢN & HƯỚNG DẪN ĐĂNG NHẬP')
      .setDescription('Cảm ơn bạn đã thanh toán! Dưới đây là thông tin đăng nhập và hướng dẫn cho iOS 16/17/18:')
      .addFields(
        { name: '📧 Tài khoản', value: '`Thueidapple2026@gmail.com`', inline: true },
        { name: '🔑 Mật khẩu', value: '`20092010.Ql`', inline: true },
        { name: '⏱️ Thời hạn', value: '**15 phút**', inline: false },
        { 
          name: '📖 HƯỚNG DẪN ĐĂNG NHẬP APP STORE (iOS CAO)', 
          value: 
            '**Bước 1:** Mở **App Store** ➔ Bấm **Icon Avatar** (Góc trên cùng bên phải) ➔ Kéo xuống dưới cùng chọn **Đăng xuất**.\n' +
            '**Bước 2:** Kéo lên đầu trang ➔ Nhập **Tài khoản & Mật khẩu** ở trên ➔ Bấm **Đăng nhập**.\n' +
            '**Bước 3 (Bỏ qua 2FA):** Nếu màn hình hiện *Bảo mật ID Apple*, bấm **`Các tùy chọn khác`** ở phía dưới ➔ Chọn **`Không nâng cấp`**.\n' +
            '**Bước 4:** Nếu máy hỏi liên kết iCloud/Cài đặt ➔ Chọn **`Không`** hoặc **`Để sau`**.', 
          inline: false 
        },
        { 
          name: '⚠️ LƯU Ý BẮT BUỘC', 
          value: 
            '• **Chỉ đăng nhập vào App Store!**\n' +
            '• **TUYỆT ĐỐI KHÔNG đăng nhập vào Cài đặt (iCloud) của máy.**\n' +
            '• **Đăng nhập iCloud bị khóa máy bạn tự chịu trách nhiệm.**\n' +
            '• **Sau khi hết 15 phút vui lòng ĐĂNG XUẤT tài khoản ra ngay!**', 
          inline: false 
        }
      )
      .setFooter({ text: 'Store Nexus - Hỗ trợ dịch vụ iOS & Game' })
      .setTimestamp();

    await interaction.reply({ embeds: [appleIdEmbed] });
  }

  if (interaction.customId === 'close_ticket') {
    await interaction.reply('Ticket sẽ tự động đóng sau 5 giây...');
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  }
});

client.login(process.env.DISCORD_TOKEN);
